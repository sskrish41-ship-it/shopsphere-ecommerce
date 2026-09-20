from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, current_user
from app.models import db, User, Address

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()
    phone = data.get('phone', '').strip()

    if not email or not password or not full_name:
        return jsonify({'error': 'Email, password, and full name are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'An account with this email already exists'}), 400

    user = User(email=email, full_name=full_name, phone=phone, role='user')
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({
        'message': 'Registration successful',
        'access_token': token,
        'user': user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    if not user.is_active:
        return jsonify({'error': 'Your account has been disabled. Please contact support.'}), 403

    token = create_access_token(identity=str(user.id))
    return jsonify({
        'message': 'Login successful',
        'access_token': token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/google', methods=['POST'])
def google_auth():
    import urllib.request
    import json

    data = request.get_json() or {}
    credential = data.get('credential') or data.get('id_token') or data.get('access_token')

    if not credential:
        return jsonify({'error': 'Google token/credential is required'}), 400

    google_user_info = None
    try:
        # Verify token with Google API
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                google_user_info = json.loads(response.read().decode('utf-8'))
    except Exception as e:
        # Try fallback userinfo endpoint if access_token was passed
        try:
            url = f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={credential}"
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req) as response:
                if response.status == 200:
                    google_user_info = json.loads(response.read().decode('utf-8'))
        except Exception as inner_e:
            return jsonify({'error': f'Failed to verify Google token: {str(e)}'}), 401

    if not google_user_info or not google_user_info.get('email'):
        return jsonify({'error': 'Invalid or expired Google authentication token'}), 401

    email = google_user_info.get('email').strip().lower()
    full_name = google_user_info.get('name') or google_user_info.get('given_name') or email.split('@')[0]
    google_id = google_user_info.get('sub') or google_user_info.get('user_id')
    avatar = google_user_info.get('picture')

    user = User.query.filter_by(email=email).first()

    if user:
        if not user.is_active:
            return jsonify({'error': 'Your account has been disabled. Please contact support.'}), 403
        if not user.google_id:
            user.google_id = google_id
        if avatar and 'unsplash' in user.avatar:
            user.avatar = avatar
        db.session.commit()
    else:
        user = User(
            email=email,
            full_name=full_name,
            avatar=avatar or 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
            google_id=google_id,
            auth_provider='google',
            role='user',
            is_active=True
        )
        db.session.add(user)
        db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({
        'message': 'Google authentication successful',
        'access_token': token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    return jsonify({'user': current_user.to_dict()}), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    data = request.get_json() or {}
    current_user.full_name = data.get('full_name', current_user.full_name)
    current_user.phone = data.get('phone', current_user.phone)
    if 'avatar' in data:
        current_user.avatar = data['avatar']
    db.session.commit()
    return jsonify({
        'message': 'Profile updated successfully',
        'user': current_user.to_dict()
    }), 200

@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    data = request.get_json() or {}
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')

    if not current_user.check_password(current_password):
        return jsonify({'error': 'Current password is incorrect'}), 400

    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters long'}), 400

    current_user.set_password(new_password)
    db.session.commit()
    return jsonify({'message': 'Password updated successfully'}), 200

# Addresses management
@auth_bp.route('/addresses', methods=['GET'])
@jwt_required()
def get_addresses():
    addresses = Address.query.filter_by(user_id=current_user.id).all()
    return jsonify({'addresses': [a.to_dict() for a in addresses]}), 200

@auth_bp.route('/addresses', methods=['POST'])
@jwt_required()
def add_address():
    data = request.get_json() or {}
    is_default = data.get('is_default', False)

    if is_default:
        Address.query.filter_by(user_id=current_user.id).update({'is_default': False})

    # If first address, make default
    count = Address.query.filter_by(user_id=current_user.id).count()
    if count == 0:
        is_default = True

    address = Address(
        user_id=current_user.id,
        full_name=data.get('full_name', current_user.full_name),
        phone=data.get('phone', current_user.phone),
        street=data.get('street', ''),
        city=data.get('city', ''),
        state=data.get('state', ''),
        postal_code=data.get('postal_code', ''),
        country=data.get('country', 'India'),
        is_default=is_default
    )
    db.session.add(address)
    db.session.commit()
    return jsonify({'message': 'Address added successfully', 'address': address.to_dict()}), 201

@auth_bp.route('/addresses/<int:address_id>', methods=['DELETE'])
@jwt_required()
def delete_address(address_id):
    address = Address.query.filter_by(id=address_id, user_id=current_user.id).first_or_404()
    db.session.delete(address)
    db.session.commit()
    return jsonify({'message': 'Address deleted successfully'}), 200
