import os

import pandas as pd
import pygsheets
from django.http import JsonResponse
from rest_framework.decorators import api_view
from utils import const

SERVICE_FILE_LOCATION = os.environ["SERVICE_FILE_LOCATION"]
EXCEL_FILE_NAME = os.environ["EXCEL_FILE_NAME"]
gc = pygsheets.authorize(service_file=SERVICE_FILE_LOCATION)
sh = gc.open(EXCEL_FILE_NAME)


@api_view(['GET'])
def get_committee_budget(request):
    wks = sh.worksheet_by_title("Budgeting")
    data = wks.get_all_values()

    df = pd.DataFrame(data[1:], columns=data[0])
    df = df[const.BUDGETING_COLS]
    df = df.map(lambda x: None if x == '' else x)
    df = df.dropna(how='all')
    df = df.sort_values(by='Semester Date1', ascending=False)

    json_list = []
    for index, row in df.iterrows():
        committees = row['Committees'].split(',')
        budgets = row['Budgets'].split(',')
        json_obj = {
            'semester': row['Input'],
            'start_date': row['Semester Date1'],
            'end_date': row['Semester Date2'],
            'committee': committees,
            'budget': budgets
        }
        json_list.append(json_obj)

    return JsonResponse(json_list, safe=False)


@api_view(['GET'])
def get_master_ledger_data(request):
    wks = sh.worksheet_by_title("New Master Ledger")
    data = wks.get_all_values()

    df = pd.DataFrame(data[1:], columns=data[0])
    df = df[const.MASTER_LEDGER_COLS]
    df = df.map(lambda x: None if x == '' else x)
    df = df.dropna(how='all')
    df = df.sort_values(by='Date', ascending=False)

    return JsonResponse(df.to_dict(orient='records'), safe=False)
