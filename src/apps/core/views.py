from django.shortcuts import render


def home(request):
    return render(request, "home.html")

def committee(request):
    return render(request, "committee.html")
