export type Getter = () => any
export type Setter = (value: any) => void
export type VueComputed = Getter | { get: Getter, set: Setter }

export type FromMobxEntry = {
  key: string,
  get: Getter,
  set?: Setter
}

export type Disposer = () => void

export interface IMobxMethods {
  reaction: (getter: Getter, reaction: (value: any) => void, any) => Disposer
}
