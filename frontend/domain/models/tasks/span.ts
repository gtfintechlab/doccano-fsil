export class Span {
  constructor(
    readonly id: number,
    private _label: number,
    readonly user: number,
    readonly startOffset: number,
    readonly endOffset: number,
    public changed:boolean,
  ) {}

  get label(): number {
    return this._label
  }

  changeLabel(label: number) {
    this._label = label
    this.changed = true
    // this._changed = true
  }
}
