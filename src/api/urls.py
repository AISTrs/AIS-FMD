from django.urls import path

from . import views

urlpatterns = [
    path("api/committee_budget_data/", views.get_committee_budget),
    path("api/master_ledger_data/", views.get_master_ledger_data),
    path("api/update_database/", views.update_database),
]
