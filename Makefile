run:
	pipenv run python src/manage.py runserver

migrate:
	pipenv run python src/manage.py makemigrations
	pipenv run python src/manage.py migrate

collect:
	[ -d static/ ] && rm -r static/ || echo "skip"
	pipenv run python src/manage.py	collectstatic

check:
	pipenv run python src/manage.py check

superuser:
	pipenv run python src/manage.py createsuperuser

setup:
	pip install pipenv
	pipenv install

init: setup migrate collect

local: setup migrate run