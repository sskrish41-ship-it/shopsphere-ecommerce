from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, current_user, jwt_required
from app.models import db, Product, Category, Brand, Review, ProductQuestion, ProductVariant, ProductSpec
from sqlalchemy import or_, and_, desc, asc

products_bp = Blueprint('products', __name__)

@products_bp.route('', methods=['GET'])
def get_products():
    query = Product.query.filter(Product.status == 'active')

    # Search keyword
    q = request.args.get('q', '').strip()
    if q:
        query = query.filter(
            or_(
                Product.name.ilike(f'%{q}%'),
                Product.description.ilike(f'%{q}%'),
                Product.short_description.ilike(f'%{q}%')
            )
        )

    # Category filter (slug or id)
    category_slug = request.args.get('category', '').strip()
    if category_slug and category_slug != 'all':
        category = Category.query.filter((Category.slug == category_slug) | (Category.id == category_slug)).first()
        if category:
            query = query.filter(Product.category_id == category.id)

    # Brand filter (slug or list)
    brand_slug = request.args.get('brand', '').strip()
    if brand_slug and brand_slug != 'all':
        brands_list = [b.strip() for b in brand_slug.split(',')]
        brands = Brand.query.filter((Brand.slug.in_(brands_list)) | (Brand.id.in_(brands_list))).all()
        if brands:
            query = query.filter(Product.brand_id.in_([b.id for b in brands]))

    # Price range
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # Rating filter
    min_rating = request.args.get('rating', type=float)
    if min_rating:
        query = query.filter(Product.rating >= min_rating)

    # Discount filter
    min_discount = request.args.get('discount', type=int)
    if min_discount:
        query = query.filter(Product.discount_percent >= min_discount)

    # Stock availability
    in_stock = request.args.get('in_stock', '').lower()
    if in_stock == 'true':
        query = query.filter(Product.stock_quantity > 0)

    # Flags
    if request.args.get('is_featured') == 'true':
        query = query.filter(Product.is_featured == True)
    if request.args.get('is_trending') == 'true':
        query = query.filter(Product.is_trending == True)
    if request.args.get('is_deal') == 'true':
        query = query.filter(Product.is_deal == True)

    # Sorting options
    sort = request.args.get('sort', 'relevance')
    if sort == 'price_low_high':
        query = query.order_by(asc(Product.price))
    elif sort == 'price_high_low':
        query = query.order_by(desc(Product.price))
    elif sort == 'newest':
        query = query.order_by(desc(Product.created_at))
    elif sort == 'highest_rated':
        query = query.order_by(desc(Product.rating))
    elif sort == 'biggest_discount':
        query = query.order_by(desc(Product.discount_percent))
    elif sort == 'popularity':
        query = query.order_by(desc(Product.review_count))
    else: # relevance
        query = query.order_by(desc(Product.id))

    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'products': [p.to_dict() for p in pagination.items],
        'total': pagination.total,
        'page': pagination.page,
        'pages': pagination.pages,
        'per_page': per_page
    }), 200

@products_bp.route('/suggestions', methods=['GET'])
def get_suggestions():
    q = request.args.get('q', '').strip()
    if not q or len(q) < 2:
        return jsonify({'suggestions': []}), 200

    products = Product.query.filter(Product.name.ilike(f'%{q}%')).limit(6).all()
    categories = Category.query.filter(Category.name.ilike(f'%{q}%')).limit(3).all()
    brands = Brand.query.filter(Brand.name.ilike(f'%{q}%')).limit(3).all()

    return jsonify({
        'products': [{'id': p.id, 'name': p.name, 'slug': p.slug, 'price': p.price, 'image': p.images[0].image_url if p.images else ''} for p in products],
        'categories': [{'id': c.id, 'name': c.name, 'slug': c.slug} for c in categories],
        'brands': [{'id': b.id, 'name': b.name, 'slug': b.slug} for b in brands]
    }), 200

@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product_by_id(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify({'product': product.to_dict(include_details=True)}), 200

@products_bp.route('/slug/<string:slug>', methods=['GET'])
def get_product_by_slug(slug):
    product = Product.query.filter_by(slug=slug).first_or_404()
    return jsonify({'product': product.to_dict(include_details=True)}), 200

@products_bp.route('/<int:product_id>/recommendations', methods=['GET'])
def get_recommendations(product_id):
    product = Product.query.get_or_404(product_id)
    
    # Same category
    related = Product.query.filter(
        Product.category_id == product.category_id,
        Product.id != product.id,
        Product.status == 'active'
    ).limit(6).all()

    # If fewer than 4, fill with trending
    if len(related) < 4:
        extra = Product.query.filter(
            Product.id != product.id,
            Product.id.notin_([p.id for p in related]),
            Product.status == 'active'
        ).limit(6 - len(related)).all()
        related.extend(extra)

    return jsonify({'recommendations': [p.to_dict() for p in related]}), 200

@products_bp.route('/compare', methods=['GET'])
def compare_products():
    ids_str = request.args.get('ids', '')
    if not ids_str:
        return jsonify({'products': []}), 200

    ids = [int(i) for i in ids_str.split(',') if i.isdigit()]
    products = Product.query.filter(Product.id.in_(ids)).all()
    return jsonify({'products': [p.to_dict(include_details=True) for p in products]}), 200

@products_bp.route('/<int:product_id>/questions', methods=['POST'])
@jwt_required()
def ask_question(product_id):
    data = request.get_json() or {}
    question_text = data.get('question', '').strip()
    if not question_text:
        return jsonify({'error': 'Question cannot be empty'}), 400

    pq = ProductQuestion(
        user_id=current_user.id,
        product_id=product_id,
        question=question_text
    )
    db.session.add(pq)
    db.session.commit()

    return jsonify({'message': 'Question submitted successfully', 'question': pq.to_dict()}), 201
