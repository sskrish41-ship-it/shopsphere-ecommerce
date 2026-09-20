import json, uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, current_user
from app.models import (
    db, Order, OrderItem, OrderStatusHistory, CartItem, Product, 
    ProductVariant, Coupon, Notification, ReturnRequest
)

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('', methods=['POST'])
@jwt_required()
def create_order():
    data = request.get_json() or {}
    shipping_address = data.get('shipping_address')
    payment_method = data.get('payment_method', 'Credit Card')
    coupon_code = data.get('coupon_code')

    if not shipping_address:
        return jsonify({'error': 'Shipping address is required'}), 400

    # Get user's cart items
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
    if not cart_items:
        return jsonify({'error': 'Your cart is empty'}), 400

    # Calculate prices and check stock
    subtotal = 0.0
    order_items_to_create = []

    for item in cart_items:
        product = Product.query.get(item.product_id)
        if not product or product.status != 'active':
            return jsonify({'error': f'Product "{product.name if product else "Unknown"}" is unavailable'}), 400

        variant = ProductVariant.query.get(item.variant_id) if item.variant_id else None
        available_stock = variant.stock_quantity if variant else product.stock_quantity

        if item.quantity > available_stock:
            return jsonify({
                'error': f'Insufficient stock for product "{product.name}". Available: {available_stock}'
            }), 400

        unit_price = variant.price_override if (variant and variant.price_override) else product.price
        subtotal += unit_price * item.quantity

        order_items_to_create.append({
            'product_id': product.id,
            'variant_id': variant.id if variant else None,
            'product_name': product.name,
            'price': unit_price,
            'quantity': item.quantity,
            'image_url': product.images[0].image_url if product.images else ''
        })

    # Validate coupon if provided
    discount_amount = 0.0
    if coupon_code:
        coupon = Coupon.query.filter_by(code=coupon_code.upper(), is_active=True).first()
        if coupon and subtotal >= coupon.min_order_amount:
            if coupon.discount_type == 'percentage':
                discount_amount = (subtotal * coupon.discount_value) / 100.0
                if coupon.max_discount_amount and discount_amount > coupon.max_discount_amount:
                    discount_amount = coupon.max_discount_amount
            else:
                discount_amount = coupon.discount_value
            discount_amount = min(discount_amount, subtotal)
            coupon.times_used += 1

    tax_amount = round(subtotal * 0.18, 2) # 18% GST
    shipping_fee = 0.0 if subtotal >= 1999.0 else 149.0 # Free shipping over ₹1,999
    total_amount = round(subtotal - discount_amount + tax_amount + shipping_fee, 2)

    order_number = 'ORD-' + datetime.utcnow().strftime('%Y%m%d') + '-' + str(uuid.uuid4())[:6].upper()

    order = Order(
        order_number=order_number,
        user_id=current_user.id,
        status='Confirmed',
        subtotal=round(subtotal, 2),
        tax_amount=tax_amount,
        shipping_fee=shipping_fee,
        discount_amount=round(discount_amount, 2),
        total_amount=total_amount,
        coupon_code=coupon_code.upper() if coupon_code else None,
        shipping_address_json=json.dumps(shipping_address),
        payment_method=payment_method,
        payment_status='Paid' if payment_method != 'Cash on Delivery' else 'Pending'
    )
    db.session.add(order)
    db.session.flush() # Get order.id

    # Create OrderItems and deduct stock
    for item_data in order_items_to_create:
        oi = OrderItem(
            order_id=order.id,
            product_id=item_data['product_id'],
            variant_id=item_data['variant_id'],
            product_name=item_data['product_name'],
            price=item_data['price'],
            quantity=item_data['quantity'],
            image_url=item_data['image_url']
        )
        db.session.add(oi)

        # Deduct stock
        product = Product.query.get(item_data['product_id'])
        product.stock_quantity = max(0, product.stock_quantity - item_data['quantity'])
        if product.stock_quantity == 0:
            product.status = 'out_of_stock'

        if item_data['variant_id']:
            variant = ProductVariant.query.get(item_data['variant_id'])
            if variant:
                variant.stock_quantity = max(0, variant.stock_quantity - item_data['quantity'])

    # Order History timeline
    h1 = OrderStatusHistory(order_id=order.id, status='Pending', notes='Order placed successfully')
    h2 = OrderStatusHistory(order_id=order.id, status='Confirmed', notes='Payment confirmed and order placed')
    db.session.add(h1)
    db.session.add(h2)

    # Notification
    notif = Notification(
        user_id=current_user.id,
        title='Order Placed Successfully!',
        message=f'Your order #{order.order_number} has been confirmed.',
        type='order',
        link=f'/orders/{order.id}'
    )
    db.session.add(notif)

    # Clear user's cart
    CartItem.query.filter_by(user_id=current_user.id).delete()

    db.session.commit()
    return jsonify({'message': 'Order placed successfully', 'order': order.to_dict()}), 201

@orders_bp.route('', methods=['GET'])
@jwt_required()
def get_user_orders():
    orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.created_at.desc()).all()
    return jsonify({'orders': [o.to_dict() for o in orders]}), 200

@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order_detail(order_id):
    order = Order.query.filter_by(id=order_id, user_id=current_user.id).first_or_404()
    return jsonify({'order': order.to_dict()}), 200

@orders_bp.route('/<int:order_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_order(order_id):
    order = Order.query.filter_by(id=order_id, user_id=current_user.id).first_or_404()

    if order.status in ['Shipped', 'Out for delivery', 'Delivered', 'Cancelled', 'Returned']:
        return jsonify({'error': f'Order cannot be cancelled at status: {order.status}'}), 400

    order.status = 'Cancelled'
    order.updated_at = datetime.utcnow()

    # Restore stock
    for item in order.items:
        product = Product.query.get(item.product_id)
        if product:
            product.stock_quantity += item.quantity
            if product.status == 'out_of_stock':
                product.status = 'active'
        if item.variant_id:
            variant = ProductVariant.query.get(item.variant_id)
            if variant:
                variant.stock_quantity += item.quantity

    # Add status history
    h = OrderStatusHistory(order_id=order.id, status='Cancelled', notes='Cancelled by customer')
    db.session.add(h)

    db.session.commit()
    return jsonify({'message': 'Order cancelled successfully', 'order': order.to_dict()}), 200

@orders_bp.route('/<int:order_id>/return', methods=['POST'])
@jwt_required()
def request_return(order_id):
    order = Order.query.filter_by(id=order_id, user_id=current_user.id).first_or_404()

    if order.status != 'Delivered':
        return jsonify({'error': 'Returns can only be requested for delivered orders'}), 400

    if order.return_request:
        return jsonify({'error': 'Return request already submitted for this order'}), 400

    data = request.get_json() or {}
    reason = data.get('reason', 'Defective or wrong item')
    comments = data.get('comments', '')

    ret = ReturnRequest(
        order_id=order.id,
        user_id=current_user.id,
        reason=reason,
        comments=comments,
        refund_amount=order.total_amount
    )
    order.status = 'Return requested'
    db.session.add(ret)

    h = OrderStatusHistory(order_id=order.id, status='Return requested', notes=f'Reason: {reason}')
    db.session.add(h)

    db.session.commit()
    return jsonify({'message': 'Return request submitted', 'return_request': ret.to_dict()}), 201
