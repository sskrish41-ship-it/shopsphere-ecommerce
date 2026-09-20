from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, current_user
from app.models import db, Wishlist, Product

wishlist_bp = Blueprint('wishlist', __name__)

@wishlist_bp.route('', methods=['GET'])
@jwt_required()
def get_wishlist():
    items = Wishlist.query.filter_by(user_id=current_user.id).all()
    return jsonify({'items': [i.to_dict() for i in items]}), 200

@wishlist_bp.route('/toggle', methods=['POST'])
@jwt_required()
def toggle_wishlist():
    data = request.get_json() or {}
    product_id = data.get('product_id')
    if not product_id:
        return jsonify({'error': 'product_id is required'}), 400

    existing = Wishlist.query.filter_by(user_id=current_user.id, product_id=product_id).first()
    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({'message': 'Removed from wishlist', 'in_wishlist': False}), 200
    else:
        item = Wishlist(user_id=current_user.id, product_id=product_id)
        db.session.add(item)
        db.session.commit()
        return jsonify({'message': 'Added to wishlist', 'in_wishlist': True, 'item': item.to_dict()}), 201

@wishlist_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def remove_from_wishlist(product_id):
    existing = Wishlist.query.filter_by(user_id=current_user.id, product_id=product_id).first_or_404()
    db.session.delete(existing)
    db.session.commit()
    return jsonify({'message': 'Removed from wishlist'}), 200
