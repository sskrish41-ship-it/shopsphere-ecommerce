import os
import uuid
from functools import wraps
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, current_user
from sqlalchemy import func, desc
from app.models import (
    db, User, Product, Category, Brand, Order, OrderItem, 
    OrderStatusHistory, Coupon, Review, ContactMessage, ReturnRequest, ProductImage, ProductVariant, ProductSpec
)

admin_bp = Blueprint('admin', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
ALLOWED_MIME_TYPES = {'image/jpeg', 'image/png', 'image/webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

@admin_bp.route('/upload-image', methods=['POST'])
@jwt_required()
def admin_upload_image():
    if not current_user or current_user.role != 'admin':
        return jsonify({'error': 'Admin privilege required'}), 403

    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    if ext not in ALLOWED_EXTENSIONS:
        return jsonify({'error': f'Unsupported file extension .{ext}. Allowed: png, jpg, jpeg, webp'}), 400

    if file.mimetype not in ALLOWED_MIME_TYPES:
        return jsonify({'error': f'Invalid image format {file.mimetype}. Allowed: JPEG, PNG, WebP'}), 400

    # Size check
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    if size > MAX_FILE_SIZE:
        return jsonify({'error': 'File size exceeds max limit of 5MB'}), 400

    filename = f"{uuid.uuid4().hex}.{ext}"
    upload_dir = os.path.abspath(os.path.join(current_app.root_path, '..', 'uploads', 'products'))
    os.makedirs(upload_dir, exist_ok=True)
    filepath = os.path.join(upload_dir, filename)
    file.save(filepath)

    image_url = f"/uploads/products/{filename}"
    return jsonify({
        'message': 'Image uploaded successfully',
        'image_url': image_url,
        'filename': filename
    }), 201

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        if not current_user or current_user.role != 'admin':
            return jsonify({'error': 'Admin privilege required'}), 403
        return fn(*args, **kwargs)
    return wrapper

@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def get_dashboard_stats():
    total_revenue = db.session.query(func.sum(Order.total_amount)).filter(Order.status != 'Cancelled').scalar() or 0.0
    total_orders = Order.query.count()
    total_customers = User.query.filter_by(role='user').count()
    total_products = Product.query.count()
    pending_orders = Order.query.filter_by(status='Pending').count()
    low_stock_products = Product.query.filter(Product.stock_quantity <= 5).count()
    pending_returns = ReturnRequest.query.filter_by(status='Requested').count()
    total_reviews = Review.query.count()

    # Revenue & Orders over past 7 days
    days = []
    revenue_chart = []
    orders_chart = []
    now = datetime.utcnow()
    for i in range(6, -1, -1):
        day_date = (now - timedelta(days=i)).date()
        days.append(day_date.strftime('%b %d'))

        day_start = datetime.combine(day_date, datetime.min.time())
        day_end = datetime.combine(day_date, datetime.max.time())

        day_rev = db.session.query(func.sum(Order.total_amount)).filter(
            Order.created_at >= day_start,
            Order.created_at <= day_end,
            Order.status != 'Cancelled'
        ).scalar() or 0.0

        day_orders = Order.query.filter(
            Order.created_at >= day_start,
            Order.created_at <= day_end
        ).count()

        revenue_chart.append({'date': day_date.strftime('%b %d'), 'revenue': round(day_rev, 2)})
        orders_chart.append({'date': day_date.strftime('%b %d'), 'orders': day_orders})

    # Sales by category
    cat_sales = db.session.query(
        Category.name,
        func.count(OrderItem.id)
    ).join(Product, Product.category_id == Category.id)\
     .join(OrderItem, OrderItem.product_id == Product.id)\
     .group_by(Category.name).all()

    category_chart = [{'category': name, 'sales': count} for name, count in cat_sales]

    # Top products
    top_products = Product.query.order_by(desc(Product.review_count)).limit(5).all()

    return jsonify({
        'stats': {
            'total_revenue': round(total_revenue, 2),
            'total_orders': total_orders,
            'total_customers': total_customers,
            'total_products': total_products,
            'pending_orders': pending_orders,
            'low_stock_products': low_stock_products,
            'pending_returns': pending_returns,
            'total_reviews': total_reviews
        },
        'charts': {
            'revenue_chart': revenue_chart,
            'orders_chart': orders_chart,
            'category_chart': category_chart
        },
        'top_products': [p.to_dict() for p in top_products]
    }), 200

# Products CRUD
@admin_bp.route('/products', methods=['GET'])
@admin_required
def admin_get_products():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    q = request.args.get('q', '').strip()

    query = Product.query
    if q:
        query = query.filter(Product.name.ilike(f'%{q}%'))

    pagination = query.order_by(Product.id.desc()).paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        'products': [p.to_dict(include_details=True) for p in pagination.items],
        'total': pagination.total,
        'page': pagination.page,
        'pages': pagination.pages
    }), 200

@admin_bp.route('/products', methods=['POST'])
@admin_required
def admin_create_product():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    price = data.get('price', 0.0)
    category_id = data.get('category_id')

    if not name or price <= 0 or not category_id:
        return jsonify({'error': 'Name, valid price, and category_id are required'}), 400

    slug = name.lower().replace(' ', '-').replace('/', '-') + '-' + str(int(datetime.utcnow().timestamp()))

    orig_price = data.get('original_price', price)
    discount = int(((orig_price - price) / orig_price) * 100) if orig_price > price else 0

    product = Product(
        name=name,
        slug=slug,
        category_id=category_id,
        brand_id=data.get('brand_id'),
        description=data.get('description', 'High quality product.'),
        short_description=data.get('short_description', name),
        price=price,
        original_price=orig_price,
        discount_percent=discount,
        stock_quantity=data.get('stock_quantity', 10),
        sku=data.get('sku', f'SKU-{int(datetime.utcnow().timestamp())}'),
        is_featured=data.get('is_featured', False),
        is_trending=data.get('is_trending', False),
        is_deal=data.get('is_deal', False),
        status=data.get('status', 'active'),
        warranty=data.get('warranty', '1 Year Warranty'),
        return_policy=data.get('return_policy', '30-Day Returns'),
        video_url=data.get('video_url', '')
    )
    db.session.add(product)
    db.session.flush()

    # Images
    images = data.get('images', [])
    if images:
        for idx, img_url in enumerate(images):
            db.session.add(ProductImage(product_id=product.id, image_url=img_url, is_primary=(idx == 0)))
    else:
        db.session.add(ProductImage(product_id=product.id, image_url='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400', is_primary=True))

    db.session.commit()
    return jsonify({'message': 'Product created successfully', 'product': product.to_dict(include_details=True)}), 201

@admin_bp.route('/products/<int:product_id>', methods=['PUT'])
@admin_required
def admin_update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.get_json() or {}

    product.name = data.get('name', product.name)
    product.category_id = data.get('category_id', product.category_id)
    product.brand_id = data.get('brand_id', product.brand_id)
    product.description = data.get('description', product.description)
    product.short_description = data.get('short_description', product.short_description)
    product.price = data.get('price', product.price)
    product.original_price = data.get('original_price', product.original_price)
    if product.original_price > product.price:
        product.discount_percent = int(((product.original_price - product.price) / product.original_price) * 100)
    else:
        product.discount_percent = 0

    product.stock_quantity = data.get('stock_quantity', product.stock_quantity)
    if product.stock_quantity > 0 and product.status == 'out_of_stock':
        product.status = 'active'
    elif product.stock_quantity == 0:
        product.status = 'out_of_stock'

    product.is_featured = data.get('is_featured', product.is_featured)
    product.is_trending = data.get('is_trending', product.is_trending)
    product.is_deal = data.get('is_deal', product.is_deal)
    product.status = data.get('status', product.status)

    if 'images' in data and data['images']:
        ProductImage.query.filter_by(product_id=product.id).delete()
        for idx, img_url in enumerate(data['images']):
            db.session.add(ProductImage(product_id=product.id, image_url=img_url, is_primary=(idx == 0)))

    db.session.commit()
    return jsonify({'message': 'Product updated successfully', 'product': product.to_dict(include_details=True)}), 200

@admin_bp.route('/products/<int:product_id>', methods=['DELETE'])
@admin_required
def admin_delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Product deleted successfully'}), 200

# Orders CRUD & Status Update
@admin_bp.route('/orders', methods=['GET'])
@admin_required
def admin_get_orders():
    status = request.args.get('status', '').strip()
    query = Order.query
    if status and status != 'all':
        query = query.filter(Order.status == status)

    orders = query.order_by(Order.created_at.desc()).all()
    return jsonify({'orders': [o.to_dict() for o in orders]}), 200

@admin_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@admin_required
def admin_update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json() or {}
    new_status = data.get('status')
    notes = data.get('notes', f'Status changed to {new_status}')

    if not new_status:
        return jsonify({'error': 'Status is required'}), 400

    order.status = new_status
    order.updated_at = datetime.utcnow()

    # If delivered, update payment status
    if new_status == 'Delivered':
        order.payment_status = 'Paid'

    h = OrderStatusHistory(order_id=order.id, status=new_status, notes=notes)
    db.session.add(h)

    db.session.commit()
    return jsonify({'message': 'Order status updated', 'order': order.to_dict()}), 200

# Return Requests approval
@admin_bp.route('/returns/<int:return_id>', methods=['PUT'])
@admin_required
def admin_process_return(return_id):
    ret = ReturnRequest.query.get_or_404(return_id)
    data = request.get_json() or {}
    status = data.get('status') # Approved, Rejected, Refunded

    ret.status = status
    if status in ['Approved', 'Refunded']:
        ret.order.status = 'Returned' if status == 'Approved' else 'Refunded'
        ret.order.payment_status = 'Refunded'

    db.session.commit()
    return jsonify({'message': f'Return request {status}', 'return_request': ret.to_dict()}), 200

# Customer Management
@admin_bp.route('/customers', methods=['GET'])
@admin_required
def admin_get_customers():
    users = User.query.filter_by(role='user').order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        d = u.to_dict()
        d['order_count'] = Order.query.filter_by(user_id=u.id).count()
        d['total_spent'] = round(db.session.query(func.sum(Order.total_amount)).filter_by(user_id=u.id).scalar() or 0.0, 2)
        result.append(d)
    return jsonify({'customers': result}), 200

@admin_bp.route('/customers/<int:user_id>/toggle-status', methods=['PUT'])
@admin_required
def admin_toggle_customer(user_id):
    user = User.query.get_or_404(user_id)
    user.is_active = not user.is_active
    db.session.commit()
    return jsonify({'message': f'Account {"enabled" if user.is_active else "disabled"}', 'user': user.to_dict()}), 200

# Coupons CRUD
@admin_bp.route('/coupons', methods=['GET', 'POST'])
@admin_required
def admin_coupons():
    if request.method == 'GET':
        coupons = Coupon.query.all()
        return jsonify({'coupons': [c.to_dict() for c in coupons]}), 200

    data = request.get_json() or {}
    code = data.get('code', '').strip().upper()
    if not code:
        return jsonify({'error': 'Code is required'}), 400

    coupon = Coupon(
        code=code,
        discount_type=data.get('discount_type', 'percentage'),
        discount_value=data.get('discount_value', 10.0),
        min_order_amount=data.get('min_order_amount', 0.0),
        max_discount_amount=data.get('max_discount_amount'),
        usage_limit=data.get('usage_limit', 100),
        is_active=data.get('is_active', True)
    )
    db.session.add(coupon)
    db.session.commit()
    return jsonify({'message': 'Coupon created', 'coupon': coupon.to_dict()}), 201

@admin_bp.route('/coupons/<int:coupon_id>', methods=['DELETE'])
@admin_required
def admin_delete_coupon(coupon_id):
    coupon = Coupon.query.get_or_404(coupon_id)
    db.session.delete(coupon)
    db.session.commit()
    return jsonify({'message': 'Coupon deleted'}), 200

# Contact messages
@admin_bp.route('/contact-messages', methods=['GET'])
@admin_required
def admin_get_contact_messages():
    messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
    return jsonify({'messages': [m.to_dict() for m in messages]}), 200
