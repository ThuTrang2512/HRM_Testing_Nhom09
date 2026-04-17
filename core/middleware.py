from django.shortcuts import redirect
from django.conf import settings

class CorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, X-CSRFToken"
        return response

class LoginRequiredMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path
        print(f"[DEBUG] Path: {path}, Authenticated: {request.user.is_authenticated}, User: {request.user}")
        
        # Paths that don't require login
        exempt_paths = [
            '/pages/login.html',
            '/employee/api/login/',
            '/admin/',
            settings.STATIC_URL,
            settings.MEDIA_URL,
            '/assets/',
        ]
        
        # Check if user is authenticated
        if not request.user.is_authenticated:
            # Check if current path is in exempt list
            is_exempt = any(path.startswith(p) for p in exempt_paths)
            
            # If not exempt, redirect to login
            if not is_exempt:
                # Redirect to login page
                return redirect('/pages/login.html')

        response = self.get_response(request)
        return response
