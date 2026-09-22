FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY src/requirements.txt ./requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

RUN python src/manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "--chdir", "src", "landguard_python.wsgi:application", "--bind", "0.0.0.0:8000"]
