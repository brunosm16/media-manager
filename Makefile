development:
	sudo docker compose -f docker-compose.development.yml up

development-updated:
	sudo docker compose -f docker-compose.development.yml up --build -V

development-down:
	sudo docker compose -f docker-compose.development.yml down