# Миграция на SaaS-архитектуру с Workspaces

## Обзор

Внедрена SaaS-архитектура с поддержкой workspaces. Теперь:

- Один пользователь может управлять несколькими workspaces
- Каждый workspace представляет компанию с интеграциями HH.ru
- Интеграции и вакансии привязаны к workspace

## Изменения в схеме БД

### Новые таблицы

**workspaces** - представляет компанию/организацию

```sql
- id (uuid, PK)
- name (text) - название компании
- slug (text, unique) - уникальный идентификатор для URL
- description (text) - описание
- website (text) - сайт компании
- logo (text) - логотип
- created_at, updated_at
```

**user_workspaces** - связь пользователей с workspaces

```sql
- user_id (text, FK -> users.id)
- workspace_id (uuid, FK -> workspaces.id)
- role (enum: owner, admin, member) - роль пользователя
- created_at, updated_at
- PK: (user_id, workspace_id)
```

### Изменения в существующих таблицах

**integrations**

- Добавлено поле `workspace_id` (uuid, FK -> workspaces.id)
- Удален constraint `unique(type)` - теперь можно несколько интеграций одного типа в разных workspace

**vacancies**

- Добавлено поле `workspace_id` (uuid, FK -> workspaces.id)

## Роли пользователей в workspace

- **owner** - владелец, полный доступ, может удалять workspace
- **admin** - администратор, может управлять настройками и пользователями
- **member** - участник, доступ только на чтение

## API (tRPC)

### workspace.list

Получить все workspaces пользователя

```typescript
const workspaces = await trpc.workspace.list.query();
```

### workspace.byId

Получить workspace по ID

```typescript
const workspace = await trpc.workspace.byId.query({ id: "uuid" });
```

### workspace.create

Создать новый workspace

```typescript
const workspace = await trpc.workspace.create.mutate({
  name: "Моя компания",
  slug: "my-company",
  description: "Описание",
  website: "https://example.com",
});
```

### workspace.update

Обновить workspace (требуется роль owner/admin)

```typescript
await trpc.workspace.update.mutate({
  id: "uuid",
  data: {
    name: "Новое название",
  },
});
```

### workspace.delete

Удалить workspace (требуется роль owner)

```typescript
await trpc.workspace.delete.mutate({ id: "uuid" });
```

### workspace.addUser

Добавить пользователя в workspace (требуется роль owner/admin)

```typescript
await trpc.workspace.addUser.mutate({
  workspaceId: "uuid",
  userId: "user-id",
  role: "member",
});
```

### workspace.removeUser

Удалить пользователя из workspace (требуется роль owner/admin)

```typescript
await trpc.workspace.removeUser.mutate({
  workspaceId: "uuid",
  userId: "user-id",
});
```

### workspace.updateUserRole

Изменить роль пользователя (требуется роль owner)

```typescript
await trpc.workspace.updateUserRole.mutate({
  workspaceId: "uuid",
  userId: "user-id",
  role: "admin",
});
```

## Миграция данных

### Шаг 1: Применить схему БД

```bash
bun db:push
```

### Шаг 2: Создать workspace по умолчанию

Для существующих пользователей нужно создать workspace и перенести данные:

```typescript
// Создать workspace
const workspace = await workspaceRepository.create({
  name: "Default Workspace",
  slug: "default",
  description: "Автоматически созданный workspace",
});

// Добавить всех пользователей как owners
const users = await db.select().from(user);
for (const u of users) {
  await workspaceRepository.addUser(workspace.id, u.id, "owner");
}

// Обновить все интеграции
await db.update(integration).set({ workspaceId: workspace.id });

// Обновить все вакансии
await db.update(vacancy).set({ workspaceId: workspace.id });
```

## Обновление UI

### Селектор workspace

Добавить в навигацию селектор для переключения между workspaces:

```tsx
import { api } from "~/trpc/react";

function WorkspaceSelector() {
  const { data: workspaces } = api.workspace.list.useQuery();
  const [currentWorkspace, setCurrentWorkspace] = useState(workspaces?.[0]);

  return (
    <Select value={currentWorkspace?.id} onValueChange={setCurrentWorkspace}>
      {workspaces?.map((ws) => (
        <SelectItem key={ws.id} value={ws.id}>
          {ws.name}
        </SelectItem>
      ))}
    </Select>
  );
}
```

### Фильтрация данных по workspace

Все запросы к интеграциям и вакансиям должны фильтроваться по текущему workspace:

```typescript
// Обновить существующие роутеры
const integrations = await db.query.integration.findMany({
  where: eq(integration.workspaceId, currentWorkspaceId),
});
```

## Следующие шаги

1. Создать UI для управления workspaces
2. Добавить страницу настроек workspace
3. Реализовать приглашения пользователей по email
4. Добавить биллинг на уровне workspace
5. Обновить все существующие роутеры для фильтрации по workspace
