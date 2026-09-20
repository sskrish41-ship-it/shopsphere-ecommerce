from flask import Blueprint, request, jsonify
from datetime import datetime
from app.models import Coupon

coupons_bp = Blueprint('coupons', __name__)

@coupons_bp.route('/validate', methods=['POST'])
def validate_coupon():
    data = request.get_json() or {}
    code = data.get('code', '').strip().upper()
    order_subtotal = data.get('subtotal', 0.0)

    if not code:
        return jsonify({'error': 'Coupon code is required'}), 400

    coupon = Coupon.query.filter_by(code=code, is_active=True).first()

    if not coupon:
        return jsonify({'error': 'Invalid coupon code'}), 404

    now = datetime.utcnow()
    if coupon.start_date and coupon.start_date > now:
        return jsonify({'error': 'Coupon is not yet active'}), 400

    if coupon.end_date and coupon.end_date < now:
        return jsonify({'error': 'Coupon has expired'}), 400

    if coupon.times_used >= coupon.usage_limit:
        return jsonify({'error': 'Coupon usage limit reached'}), 400

    if order_subtotal < coupon.min_order_amount:
        return jsonify({
            'error': f'Minimum order amount of ₹{int(coupon.min_order_amount)} required for this coupon.'
        }), 400

    # Calculate discount
    if coupon.discount_type == 'percentage':
        discount = (order_subtotal * coupon.discount_value) / 100.0
        if coupon.max_discount_amount and discount > coupon.max_discount_amount:
            discount = coupon.max_discount_amount
    else:
        discount = coupon.discount_value

    discount = min(discount, order_subtotal)

    return jsonify({
        'message': 'Coupon applied successfully',
        'coupon': coupon.to_dict(),
        'discount_amount': round(discount, 2)
    }), 200

@coupons_bp.route('', methods=['GET'])
def get_public_coupons():
    now = datetime.utcnow()
    coupons = Coupon.query.filter(
        Coupon.is_active == True,
        (Coupon.end_date == None) | (Coupon.end_date > now)
    ).all()
    return jsonify({'coupons': [c.to_dict() for c in coupons]}), 200
