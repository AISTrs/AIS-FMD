# Create your models here.
import datetime

from django.db import models


class MasterLedger(models.Model):
    Date = models.DateField(default=datetime.datetime.now)
    Amount = models.FloatField(default=0.0)
    Details = models.TextField(default="N/A")
    Budget = models.CharField(default="N/A", max_length=100)
    Purpose = models.CharField(default="N/A", max_length=100)
    Account = models.CharField(default="N/A", max_length=100)


class Budget(models.Model):
    Semester = models.CharField(default="N/A", max_length=100)
    StartDate = models.DateField(default=datetime.datetime.now)
    EndDate = models.DateField(default=datetime.datetime.now)
    Committees = models.TextField(default="N/A")
    Budgets = models.TextField(default="N/A")
