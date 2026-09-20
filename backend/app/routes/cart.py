from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, current_user
from app.models import db, CartItem, Product, ProductVariant

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('', methods=['GET'])
@jwt_required()
def get_cart():
    items = CartItem.query.filter_by(user_id=current_user.id).all()
    cart_data = [item.to_dict() for item in items]
    
    subtotal = sum((item.product.price if not item.variant or not item.variant.price_override else item.variant.price_override) * item.quantity for item in items if item.product)
    
    return jsonify({
        'items': cart_data,
        'item_count': sum(item.quantity for item in items),
        'subtotal': round(subtotal, 2)
    }), 200

@cart_bp.route('/items', methods=['POST'])
@jwt_required()
def add_to_cart():
    data = request.get_json() or {}
    product_id = data.get('product_id')
    variant_id = data.get('variant_id')
    quantity = data.get('quantity', 1)

    if not product_id:
        return jsonify({'error': 'product_id is required'}), 400

    product = Product.query.get_or_404(product_id)

    # Check stock
    available_stock = product.stock_quantity
    if variant_id:
        variant = ProductVariant.query.get(variant_id)
        if variant:
            available_stock = variant.stock_quantity

    existing_item = CartItem.query.filter_by(
        user_id=current_user.id,
        product_id=product_id,
        variant_id=variant_id
    ).first()

    new_total_qty = quantity + (existing_item.quantity if existing_item else 0)
    if new_total_qty > available_stock:
        return jsonify({
            'error': f'Cannot add item. Only {available_stock} available in stock.'
        }), 400

    if existing_item:
        existing_item.quantity = new_total_qty
    else:
        existing_item = CartItem(
            user_id=current_user.id,
            product_id=product_id,
            variant_id=variant_id,
            quantity=quantity
        )
        db.session.add(existing_item)

    db.session.commit()
    return jsonify({'message': 'Item added to cart', 'item': existing_item.to_dict()}), 201

@cart_bp.route('/items/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(item_id):
    data = request.get_json() or {}
    quantity = data.get('quantity', 1)

    item = CartItem.query.filter_by(id=item_id, user_id=current_user.id).first_or_404()

    available_stock = item.product.stock_quantity if item.product else 0
    if item.variant:
        available_stock = item.variant.stock_quantity

    if quantity > available_stock:
        return jsonify({
            'error': f'Stock limit reached. Maximum {available_stock} available.'
        }), 400

    if quantity <= 0:
        db.session.delete(item)
        db.session.commit()
        return jsonify({'message': 'Item removed from cart'}), 200

    item.quantity = quantity
    db.session.commit()
    return jsonify({'message': 'Cart updated', 'item': item.to_dict()}), 200

@cart_bp.route('/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_cart_item(item_id):
    item = CartItem.query.filter_by(id=item_id, user_id=current_user.id).first_or_404()
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Item removed from cart'}), 200

@cart_bp.route('/sync', methods=['POST'])
@jwt_required()
def sync_cart():
    data = request.get_json() or {}
    guest_items = data.get('items', [])

    for g in guest_items:
        product_id = g.get('product_id')
        variant_id = g.get('variant_id')
        qty = g.get('quantity', 1)

        if not product_id:
            continue

        existing = CartItem.query.filter_by(
            user_id=current_user.id,
            product_id=product_id,
            variant_id=variant_id
        ).first()

        if existing:
            existing.quantity += qty
        else:
            db.session.add(CartItem(
                user_id=current_user.id,
                product_id=product_id,
                variant_id=variant_id,
                quantity=qty
            ))

    db.session.commit()
    items = CartItem.query.filter_by(user_id=current_user.id).all()
    return jsonify({'items': [i.to_dict() for i in items]}), 200
