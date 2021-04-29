// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Embed, IQnaEmbedConfiguration } from 'powerbi-client';
import { PowerBIEmbedComponent } from '../powerbi-embed/powerbi-embed.component';

@Component({
  selector: 'powerbi-qna[embedConfig]',
  template: '<div class={{cssClassName}} #qnaContainer></div>',
})

/**
 * Qna component to embed the Qna visual, extends Base component
 */
export class PowerBIQnaEmbedComponent
  extends PowerBIEmbedComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  // Input() specify properties that will be passed from parent
  // Configuration for embedding the PowerBI Qna visual (Required)
  @Input()
  embedConfig!: IQnaEmbedConfiguration;

  // Ref to the HTML div container element
  @ViewChild('qnaContainer')
  private containerRef!: ElementRef<HTMLDivElement>;

  // Embedded entity
  // Note: Do not read or assign to this member variable directly, instead use the getter and setter
  private _embed?: Embed;

  // Getter for this._embed
  private get embed(): Embed | undefined {
    return this._embed;
  }

  // Setter for this._embed
  private set embed(newEmbedInstance: Embed | undefined) {
    this._embed = newEmbedInstance;
  }

  constructor() {
    super();
  }

  ngOnInit(): void {
    // Initialize PowerBI service instance variable from parent
    super.ngOnInit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const prevEmbedConfig = changes.embedConfig.previousValue as IQnaEmbedConfiguration;

    // Input from parent get updated, thus call embedOrUpdateQna function
    this.embedOrUpdateQna(prevEmbedConfig);
  }

  ngAfterViewInit(): void {
    // Check if container exists on the UI
    if (this.containerRef.nativeElement) {
      // Decide to embed or bootstrap
      if (this.embedConfig.accessToken && this.embedConfig.embedUrl) {
        this.embedQnaVisual();
      } else {
        this.embed = this.powerbi.bootstrap(this.containerRef.nativeElement, this.embedConfig);
      }
    }
  }

  ngOnDestroy(): void {
    // Clean up
    if (this.containerRef.nativeElement) {
      this.powerbi.reset(this.containerRef.nativeElement);
    }
  }

  /**
   * Embed the PowerBI QnA Visual
   *
   * @returns void
   */
  private embedQnaVisual(): void {
    // Check if the HTML container is rendered and available
    if (!this.containerRef.nativeElement) {
      return;
    }

    this.embed = this.powerbi.embed(this.containerRef.nativeElement, this.embedConfig);
  }

  /**
   * When component updates, choose to _embed_ the powerbi qna visual
   * or do nothing if the embedUrl and accessToken did not update in the new properties
   *
   * @param prevEmbedConfig IQnaEmbedConfiguration
   * @returns void
   */
  private embedOrUpdateQna(prevEmbedConfig: IQnaEmbedConfiguration) {
    // Check if Embed URL and Access Token are present in current properties
    if (!this.embedConfig.accessToken || !this.embedConfig.embedUrl) {
      return;
    }

    // Check if the function is being called for the first time
    // prevEmbedConfig will not be available
    if (!prevEmbedConfig) {
      return;
    }

    // Embed in the following scenario
    // Embed URL is updated (E.g. New Qna visual is to be embedded)
    if (this.containerRef.nativeElement && this.embedConfig.embedUrl !== prevEmbedConfig.embedUrl) {
      this.embedQnaVisual();
    }
  }
}
