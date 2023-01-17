import type {User} from "@/types";
import {provide, reactive, watch} from "vue";
import axios from "axios";
import profileService from "@/services/profile";

export interface Session {
    token: string
    user: User
}


let defaults = {
    token: "",
    user: {} as User,
} as Session

function init() {

}


// Save the Preferences object to localStorage
function save(session: Session) {
    // Convert the object to a string
    let payload = JSON.stringify(session)
    // Save the string to localStorage
    localStorage.setItem("session", payload)
}

// Restores values from a previous save, or sets defaults
function restore(): Session {
    // Get the session string from localStorage
    let stored = localStorage.getItem("session")
    // If the retrieval was successful, parse it
    if (stored) {
        // Parse the string to the Preferences object
        return JSON.parse(stored)
    } else {
        // If the retrieval failed, save the default values to localStorage
        save(defaults)
        // Return the default parameters
        return defaults
    }
}

export function getSession() {
    return reactive<Session>(restore())
}

export function useSession() {
    // Create a reactive object to contain the preferences
    let session = reactive<Session>(restore())
    // Watch all changes made to the Preferences reactive object
    watch(session, () => {
        // Save any changes to localStorage
        save(session)
    })
    return session
}

