# Root Makefile for a Groundcrew project.
# Plain-language targets so the owner can run the whole app with one command.
# Adjust service names to match docker-compose.yml.

.PHONY: help setup up down logs test lint audit gate deploy

help:            ## Show available commands
	@grep -E '^[a-z-]+:.*##' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  make %-10s %s\n", $$1, $$2}'

setup:           ## First-time setup: fetch all services and create local env files
	git submodule update --init --recursive
	@[ -f .env ] || cp .env.example .env
	@echo "Setup done. Fill in .env, then run: make up"

up:              ## Start the whole app locally
	docker compose up -d --build

down:            ## Stop the app
	docker compose down

logs:            ## Follow logs from every service
	docker compose logs -f

test:            ## Run every service's tests
	git submodule foreach --quiet 'if [ -f Makefile ]; then $(MAKE) test; fi'

lint:            ## Lint every service
	git submodule foreach --quiet 'if [ -f Makefile ]; then $(MAKE) lint; fi'

audit:           ## Dependency vulnerability scan for every service
	git submodule foreach --quiet 'if [ -f Makefile ]; then $(MAKE) audit; fi'

gate:            ## Check that QA, security and legal have passed
	node .groundcrew/gatecheck.cjs

deploy: gate     ## Deploy (only runs if the gate passes)
	@echo "Add the deploy steps for your host here."
