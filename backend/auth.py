from db import get_connection
import hashlib
import jwt
from datetime import datetime, timedelta

SECRET_KEY = "sua_chave_secreta_muito_segura_aqui"

def hash_password(password):
    """Cria hash da senha"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_user(username, password, role="SALES"):
    """Cria um novo usuário no banco"""
    conn = get_connection()
    cursor = conn.cursor()
    
    hashed_password = hash_password(password)
    
    try:
        cursor.execute("""
            INSERT INTO users (name, password, role) 
            VALUES (%s, %s, %s)
        """, (username, hashed_password, role))
        conn.commit()
        return {"success": True, "message": "Usuário criado com sucesso"}
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()

def authenticate_user(username, password):
    """Autentica um usuário e retorna um JWT token"""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT id, name, role FROM users 
            WHERE name = %s AND password = %s
        """, (username, password))
        
        user = cursor.fetchone()
        
        if user:
            # Criar JWT token
            payload = {
                'id': user['id'],
                'name': user['name'],
                'role': user['role'],
                'exp': datetime.utcnow() + timedelta(hours=24)
            }
            token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
            
            return {
                "success": True,
                "token": token,
                "user": {
                    "id": user['id'],
                    "name": user['name'],
                    "role": user['role']
                }
            }
        else:
            return {"success": False, "message": "Usuário ou senha incorretos"}
    
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        cursor.close()
        conn.close()

def get_user_by_token(token):
    """Verifica o token JWT e retorna os dados do usuário"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return {"success": True, "user": payload}
    except jwt.ExpiredSignatureError:
        return {"success": False, "message": "Token expirado"}
    except jwt.InvalidTokenError:
        return {"success": False, "message": "Token inválido"}