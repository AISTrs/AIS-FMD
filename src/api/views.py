import os

import pandas as pd
import pygsheets
from apps.core.models import MasterLedger, Budget
from apps.core.serializer import MasterLedgerSerializer
from django.http import JsonResponse
from rest_framework.decorators import api_view
from utils import const

SERVICE_FILE_LOCATION = os.environ["SERVICE_FILE_LOCATION"]
EXCEL_FILE_NAME = os.environ["EXCEL_FILE_NAME"]
gc = pygsheets.authorize(service_file=SERVICE_FILE_LOCATION)
sh = gc.open(EXCEL_FILE_NAME)


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
def get_master_ledger_data(request):
    serializer = MasterLedgerSerializer(MasterLedger.objects.all(), many=True)
    return JsonResponse(serializer.data, safe=False)


@api_view(["POST"])
def update_database(request):
    # update Master Ledger
    wks = sh.worksheet_by_title("Master Ledger")
    data = wks.get_all_values()

    df = pd.DataFrame(data[1:], columns=data[0])
    df = df[const.MASTER_LEDGER_COLS]
    df = df.map(lambda x: None if x == '' else x)
    df = df.dropna(how='all')
    df['Date'] = df['Date'].fillna(pd.Timestamp.today().date())
    df['Amount'] = df['Amount'].fillna(0)
    df = df.fillna("N/A")

    df = df.to_dict(orient='records')

    instances = [MasterLedger(**record) for record in df]
    MasterLedger.objects.all().delete()
    MasterLedger.objects.bulk_create(instances)

    # update Budgeting

    wks = sh.worksheet_by_title("Budgeting")
    data = wks.get_all_values()

    df = pd.DataFrame(data[1:], columns=data[0])
    df = df[const.BUDGETING_COLS]
    df = df.map(lambda x: None if x == '' else x)
    df = df.dropna(how='all')

    instances = []

    for index, row in df.iterrows():
        json_obj = {
            'Semester': row['Input'],
            'StartDate': row['Semester Date1'],
            'EndDate': row['Semester Date2'],
            'Committees': row['Committees'],
            'Budgets': row['Budgets']
        }
        instances.append(Budget(**json_obj))

    Budget.objects.all().delete()
    Budget.objects.bulk_create(instances)

    return JsonResponse({"message": "Database updated Successfully!!!!"}, safe=False)
