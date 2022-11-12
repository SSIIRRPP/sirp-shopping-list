import deepEqual from 'deep-equal';

export interface UpdateComparerConfig<T, P extends string | number | symbol> {
  newItems: Record<P, T>;
  oldItems: Record<P, T>;
}

export default class UpdateComparer<
  T extends { [key: string]: any },
  P extends string | number | symbol
> {
  private newItems: Record<P, T>;
  private oldItems: Record<P, T>;

  constructor(config: UpdateComparerConfig<T, P>) {
    this.newItems = config.newItems;
    this.oldItems = config.oldItems;
  }

  private checkNewItems(): Set<P> {
    return this.getAbsentItems(this.newItems ?? {}, this.oldItems ?? {});
  }

  private checkDeletedItems(): Set<P> {
    return this.getAbsentItems(this.oldItems ?? {}, this.newItems ?? {});
  }

  private checkUpdatedItems(): Set<P> {
    const updatedKeys = new Set<P>();

    Object.entries(this.newItems).forEach(([key, value]) => {
      const oldItem = this.oldItems[key as P];
      if (oldItem && !deepEqual(oldItem, value)) {
        updatedKeys.add(key as P);
      }
    });

    return updatedKeys;
  }

  private getAbsentItems(
    record1: Record<string, T>,
    record2: Record<string, T>
  ): Set<P> {
    const keys = new Set<P>();

    Object.keys(record1).forEach((key) => {
      if (!record2[key]) {
        keys.add(key as P);
      }
    });

    return keys;
  }

  compare() {
    return {
      put: this.checkNewItems(),
      delete: this.checkDeletedItems(),
      update: this.checkUpdatedItems(),
    };
  }
}
