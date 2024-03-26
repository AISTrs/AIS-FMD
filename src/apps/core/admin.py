from django.contrib import admin

from .models import *


class MasterLedgerAdmin(admin.ModelAdmin):
    list_display = ("Date", "Amount", "Details", "Budget", "Purpose", "Account")
    list_filter = ("Date", "Budget", "Purpose", "Account")
    search_fields = ("Date", "Budget", "Purpose", "Account", "Details")

    def has_delete_permission(self, request, obj=None):
        return False

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


class BudgetAdmin(admin.ModelAdmin):
    list_display = ("Semester", "StartDate", "EndDate", "Committees", "Budgets")

    def has_delete_permission(self, request, obj=None):
        return False

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


admin.site.register(MasterLedger, MasterLedgerAdmin)
admin.site.register(Budget, BudgetAdmin)
