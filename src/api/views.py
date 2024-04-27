import datetime
import os

import gspread
from apps.core.models import MasterLedger, Budget
from apps.core.serializer import MasterLedgerSerializer
from django.http import JsonResponse
from oauth2client.service_account import ServiceAccountCredentials
from rest_framework.decorators import api_view

SERVICE_FILE_LOCATION = os.environ["SERVICE_FILE_LOCATION"]

SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

# Authorize using the service account credentials
creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_FILE_LOCATION, SCOPES)
client = gspread.authorize(creds)
SHEET_ID = os.environ["EXCEL_SHEET_ID"]


@api_view(['GET'])
def get_committee_budget(request):
    json_list = []
    for budget in Budget.objects.all().order_by('-StartDate'):
        committees = budget.Committees.split(',')
        budgets = budget.Budgets.split(',')
        json_obj = {
            'semester': budget.Semester,
            'start_date': budget.StartDate,
            'end_date': budget.EndDate,
            'committee': committees,
            'budget': budgets
        }
        json_list.append(json_obj)

    return JsonResponse(json_list, safe=False)


@api_view(['GET'])
def get_master_ledger_data(request, committee = None):
    queryset = MasterLedger.objects

    if committee:
        queryset = queryset.filter(Budget = committee)

    if request.user.groups.filter(name__in=[committee, 'admin_group']).exists() or request.user.is_superuser:
        serializer = MasterLedgerSerializer(queryset, many=True)
        return JsonResponse(serializer.data, safe=False)
    else:
        return JsonResponse({'error': 'You do not have permission to access this resource.'}, safe=False)


@api_view(["GET"])
def update_database(request):
    # update Master Ledger

    # Open the "Master Ledger" worksheet and get data
    master_sheet = client.open_by_key(SHEET_ID).worksheet("Master Ledger")
    master_data = master_sheet.get_all_values()

    # Open the "cash ledger" worksheet and get data
    cash_sheet = client.open_by_key(SHEET_ID).worksheet("Cash Ledger")
    cash_data = cash_sheet.get_all_values()

    for row in cash_data[1:]:
        row.append("cash")

    header = master_data[0]
    records = master_data[1:] + cash_data[1:]

    instances = []
    for record in records:
        instance_data = dict(zip(header, record))
        instance_data['Date'] = instance_data.get('Date') if instance_data.get(
            'Date') else datetime.datetime.now().strftime('%Y-%m-%d')
        instance_data['Amount'] = instance_data.get('Amount') if instance_data.get('Amount') else 0
        instance_data = {key: value if value != '' else "N/A" for key, value in instance_data.items() if key != ''}

        if instance_data['Budget'].lower() != 'transfers':
            instances.append(MasterLedger(**instance_data))

    # Delete existing records and bulk create new records
    MasterLedger.objects.all().delete()
    MasterLedger.objects.bulk_create(instances)

    master_ledger_count = len(instances)

    # update Budgeting

    sheet = client.open_by_key(SHEET_ID).worksheet("Budgeting")
    data = sheet.get_all_values()
    records = data[1:]

    instances = []
    for record in records:
        if all(record):
            json_obj = {
                'Semester': record[0],
                'StartDate': record[1],
                'EndDate': record[2],
                'Committees': record[3],
                'Budgets': record[4]
            }
            instances.append(Budget(**json_obj))

    # Delete existing records and bulk create new records
    Budget.objects.all().delete()
    Budget.objects.bulk_create(instances)
    budget_count = len(instances)

    return JsonResponse({"message": f"""Database updated Successfully!!!!""",
                         "No of Master ledger records": master_ledger_count,
                         "No of Budget records": budget_count,
                         }, safe=False)
