"""
URL configuration for core project.
"""
import mimetypes
mimetypes.add_type("application/javascript", ".js", True)
mimetypes.add_type("text/css", ".css", True)

import os
import pages.views
from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse, HttpResponseRedirect
from django.views.static import serve
from django.contrib.auth import logout

def favicon_view(request):
    return HttpResponse(status=204)

def root_redirect(request):
    logout(request)
    return HttpResponseRedirect('/pages/login.html')

urlpatterns = [
    path('', root_redirect),
    path('admin/', admin.site.urls),
    path('favicon.ico', favicon_view),
    
    # Dashboard - prioritizing this
    path('dashboard/', pages.views.dashboard, name='dashboard'),
    path('dashboard', lambda r: HttpResponseRedirect('/dashboard/')),

    # Modules
    path('employee/', include('pages.employee.urls')),
    path('contract/', include('pages.contract.urls')),
    path('salary/', include('pages.salary.urls')),
    path('requests/', include('pages.request.urls')),
    path('schedule/', include('pages.schedule.urls')),
    path('report/', include('pages.report.urls', namespace='report')),

    # Shortcuts
    path('salary', lambda r: HttpResponseRedirect('/pages/salary/salary.html')),
    
    # Serving static files
    re_path(r'^pages/(?P<path>.*)$', serve, {'document_root': os.path.join(settings.BASE_DIR, 'pages')}),
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': os.path.join(settings.BASE_DIR, 'assets')}),
    re_path(r'^(?P<path>index\.html)$', serve, {'document_root': settings.BASE_DIR}),
    
    # Catch-all (Disabled the greedy one that caused 404 on /dashboard)
    # re_path(r'^(?P<path>.*)$', serve, {'document_root': settings.BASE_DIR, 'show_indexes': True}),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
