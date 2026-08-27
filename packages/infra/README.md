# @solstatus/infra

Infrastructure configuration and deployment for SolStatus.

## Installation

```bash
nub add @solstatus/infra
```

## Database Management

To generate the latest migration files, run:
```shell
nub run db:generate
```

Then, test the migration locally:
```shell
nub run db:migrate
```

To run the migration script for production:
```shell
nub run db:migrate:prod
```

To view/edit your database with Drizzle Studio:
```shell
# Local database
nub run db:studio

# Production database
nub run db:studio:prod
```
