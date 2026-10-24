REPORT_DIRECTORY = docs/test-report

.PHONY: test-database test-report

test-database:
	docker compose up -d --wait postgres-test

# Regenerates docs/test-report/report.html and docs/test-report/coverage/index.html.
# Coverage puts a .gitignore of * in its folder, which would keep the report out of git, so the
# last line removes it.
test-report: test-database
	cd backend && uv run pytest \
		--html=../$(REPORT_DIRECTORY)/report.html --self-contained-html \
		--cov=app --cov-branch --cov-report=term-missing \
		--cov-report=html:../$(REPORT_DIRECTORY)/coverage
	rm -f $(REPORT_DIRECTORY)/coverage/.gitignore
