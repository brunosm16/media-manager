development:
	sudo docker compose -f docker-compose.development.yml up

development-updated:
	sudo docker compose -f docker-compose.development.yml up --build -V

development-down:
	sudo docker compose -f docker-compose.development.yml down

debug:
	sudo docker compose -f docker-compose.debug.yml up

debug-updated:
	sudo docker compose -f docker-compose.debug.yml up --build -V

debug-down:
	sudo docker compose -f docker-compose.debug.yml down
