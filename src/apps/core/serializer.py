from rest_framework import serializers

from .models import MasterLedger


class MasterLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterLedger
        fields = "__all__"
