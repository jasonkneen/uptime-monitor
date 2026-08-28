import * as Alchemy from "alchemy"
import * as Cloudflare from "alchemy/Cloudflare"
import * as State from "alchemy/State"

export interface StackOptionsInput {
  readonly providers?: unknown
  readonly state?: unknown
}

export function stackOptions<Req = never>(input: StackOptionsInput = {}): Alchemy.StackProps<Req> {
  return {
    providers: input.providers ?? Cloudflare.providers(),
    state: input.state ?? Alchemy.localState(),
  } as Alchemy.StackProps<Req>
}

export function localTestStackOptions() {
  return {
    dev: true,
    providers: Cloudflare.providers(),
    stage: "test",
    state: State.inMemoryState(),
  } as const
}
