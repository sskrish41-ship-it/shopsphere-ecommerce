from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, current_user
from app.models import db, Review, Product

reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('/product/<int:product_id>', methods=['GET'])
def get_product_reviews(product_id):
    reviews = Review.query.filter_by(product_id=product_id, status='approved').order_by(Review.created_at.desc()).all()
    return jsonify({'reviews': [r.to_dict() for r in reviews]}), 200

@reviews_bp.route('/product/<int:product_id>', methods=['POST'])
@jwt_required()
def add_review(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.get_json() or {}

    rating = data.get('rating', 5)
    title = data.get('title', '').strip()
    comment = data.get('comment', '').strip()

    if not title or not comment:
        return jsonify({'error': 'Title and comment are required'}), 400

    review = Review(
        user_id=current_user.id,
        product_id=product_id,
        rating=rating,
        title=title,
        comment=comment,
        is_verified_purchase=True,
        status='approved'
    )
    db.session.add(review)

    # Recalculate product rating
    all_reviews = Review.query.filter_by(product_id=product_id, status='approved').all()
    total_rating = sum(r.rating for r in all_reviews) + rating
    new_count = len(all_reviews) + 1
    product.rating = round(total_rating / new_count, 1)
    product.review_count = new_count

    db.session.commit()
    return jsonify({'message': 'Review submitted successfully', 'review': review.to_dict()}), 201

@reviews_bp.route('/<int:review_id>/helpful', methods=['POST'])
def mark_helpful(review_id):
    review = Review.query.get_or_404(review_id)
    review.helpful_count += 1
    db.session.commit()
    return jsonify({'message': 'Marked helpful', 'helpful_count': review.helpful_count}), 200
