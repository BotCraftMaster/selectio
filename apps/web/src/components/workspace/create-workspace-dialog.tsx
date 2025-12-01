"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@selectio/ui";
import { Building2, Upload } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const workspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Название обязательно")
    .max(50, "Название не должно превышать 50 символов"),
  slug: z
    .string()
    .min(1, "Slug обязателен")
    .max(30, "Slug не должен превышать 30 символов")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug может содержать только строчные буквы, цифры и дефисы",
    ),
  logo: z.instanceof(File).optional(),
});

type WorkspaceFormValues = z.infer<typeof workspaceSchema>;

interface CreateWorkspaceDialogProps {
  trigger?: React.ReactNode;
  onSubmit?: (values: WorkspaceFormValues) => Promise<void> | void;
}

export function CreateWorkspaceDialog({
  trigger,
  onSubmit,
}: CreateWorkspaceDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const handleNameChange = (value: string) => {
    form.setValue("name", value);

    // Автоматическая генерация slug из названия
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 30);

    if (!form.formState.dirtyFields.slug) {
      form.setValue("slug", slug);
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("logo", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (values: WorkspaceFormValues) => {
    try {
      await onSubmit?.(values);
      setOpen(false);
      form.reset();
      setLogoPreview(null);
    } catch (error) {
      console.error("Error creating workspace:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Создать workspace</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="size-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Создать workspace</DialogTitle>
          <DialogDescription>
            Настройте общее пространство для управления ссылками с вашей
            командой.{" "}
            <Link href="#" className="text-primary hover:underline">
              Узнать больше
            </Link>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название workspace</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Acme, Inc."
                      {...field}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace slug</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">
                        app.dub.co/
                      </span>
                      <Input placeholder="acme" {...field} className="flex-1" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Вы можете изменить это позже в настройках workspace
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo"
              render={() => (
                <FormItem>
                  <FormLabel>Логотип workspace</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <div className="flex size-16 items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="size-full rounded-lg object-cover"
                          />
                        ) : (
                          <Building2 className="size-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="gap-2"
                        >
                          <Upload className="size-4" />
                          Загрузить изображение
                        </Button>
                        <p className="text-muted-foreground mt-2 text-xs">
                          Рекомендуемый размер: 160x160px
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoChange}
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Создание..."
                : "Создать workspace"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
