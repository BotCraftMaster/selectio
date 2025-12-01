# Быстрый старт с Workspaces

## Что изменилось

Внедрена SaaS-архитектура:
- Один пользователь → несколько workspaces
- Workspace = компания с интеграциями HH.ru
- Роли: owner, admin, member

## Миграция существующих данных

```bash
# 1. Применить схему БД
bun db:push

# 2. Мигрировать данные
bun db:migrate-workspaces
```

Скрипт создаст workspace "Default Workspace" и перенесет все данные.

## Создание workspace через API

```typescript
// Создать workspace
const workspace = await trpc.workspace.create.mutate({
  name: "Моя компания",
  slug: "my-company",
});

// Добавить интеграцию HH.ru
await trpc.integration.create.mutate({
  workspaceId: workspace.id,
  type: "hh",
  name: "HeadHunter",
  credentials: { email: "...", password: "..." },
});
```

## TODO

- [ ] Обновить UI для выбора workspace
- [ ] Добавить фильтрацию по workspace в роутерах
- [ ] Реализовать приглашения пользователей
- [ ] Добавить биллинг на уровне workspace

Подробнее: [WORKSPACE_MIGRATION.md](./WORKSPACE_MIGRATION.md)
