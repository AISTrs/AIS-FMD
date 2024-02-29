run:
	pipenv run python src/manage.py runserver

migrate:
	pipenv run python src/manage.py makemigrations
	pipenv run python src/manage.py migrate

check:
	pipenv run python src/manage.py check

superuser:
	pipenv run python src/manage.py createsuperuser

setup:
	pip install pipenv
	pipenv install

local: setup migrate run