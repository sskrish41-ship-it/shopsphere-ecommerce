import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'shopsphere-secret-key-super-secure-2026')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///shopsphere.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'shopsphere-jwt-secret-key-2026')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
