import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function useValidatedForm(schema, defaultValues = {}, options = {}) {
  return useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: options.mode || "onChange",
    reValidateMode: "onChange",
    ...options,
  });
}
