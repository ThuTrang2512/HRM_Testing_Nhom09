from django.urls import path
from . import views

urlpatterns = [
    path('api/data/', views.get_contract_data, name='contract-data'),
    path('api/action/', views.sync_contract_action, name='contract-action'),
]
