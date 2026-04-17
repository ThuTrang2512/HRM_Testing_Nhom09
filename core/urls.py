"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
import mimetypes
mimetypes.add_type("application/javascript", ".js", True)
mimetypes.add_type("text/css", ".css", True)

from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse, HttpResponseRedirect
from django.views.static import serve
import os

def favicon_view(request):
    return HttpResponse(status=204)

from django.contrib.auth import logout

def root_redirect(request):
    logout(request)
    return HttpResponseRedirect('/pages/login.html')

urlpatterns = [
    path('', root_redirect),
    path('admin/', admin.site.urls),
    path('favicon.ico', favicon_view),
    
    # Modules
    path('api/login/', include([
        path('', include('pages.employee.urls')), # This might not be ideal, let's look at employee/urls.py
    ])),
    path('employee/', include('pages.employee.urls')),
    path('contract/', include('pages.contract.urls')),
    path('salary/', include('pages.salary.urls')),
    path('requests/', include('pages.request.urls')),
    path('report/', include('pages.report.urls')),
    
    # Shortcuts
    path('salary', lambda r: HttpResponseRedirect('/pages/salary/salary.html')),
    
    # Serving static files
    re_path(r'^pages/(?P<path>.*)$', serve, {'document_root': os.path.join(settings.BASE_DIR, 'pages')}),
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': os.path.join(settings.BASE_DIR, 'assets')}),
    re_path(r'^(?P<path>index\.html)$', serve, {'document_root': settings.BASE_DIR}),
    
    # Catch-all from develop branch
    re_path(r'^(?P<path>.*)$', serve, {'document_root': settings.BASE_DIR, 'show_indexes': True}),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
