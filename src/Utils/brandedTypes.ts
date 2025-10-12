// se https://www.bekk.no/fag/artikkel/branded-types-i-typescript-100131
declare const __brand: unique symbol;

export type Brand<T, TBrand> = T & { [__brand]: TBrand };
