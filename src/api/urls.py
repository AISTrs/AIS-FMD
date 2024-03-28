from django.urls import path, re_path

from . import views

urlpatterns = [
    path("api/committee_budget_data/", views.get_committee_budget),
    re_path(r"^api/master_ledger_data/(?:(?P<committee>[\w\s-]+)/)?$", views.get_master_ledger_data),
    path("api/update_database/", views.update_database),
]
