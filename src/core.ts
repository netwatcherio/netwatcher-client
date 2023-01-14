import type {Router} from "vue-router";
import {useRouter} from "vue-router";
import {inject} from "vue";
import {usePersistent} from "@/persistent";
import type {Preferences} from "@/types";
import type {Remote} from "@/remote";

export interface Core {
    router: () => Router,
    remote: () => Remote,
    persistent: () => Preferences
}

export default {
    session: () => useRouter(),
    router: () => useRouter(),
    remote: () => inject("remote") as Remote,
    persistent: () => usePersistent() as Preferences
} as Core
