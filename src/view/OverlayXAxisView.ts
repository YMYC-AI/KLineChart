/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type Nullable from '../common/Nullable'
import type Coordinate from '../common/Coordinate'
import type Bounding from '../common/Bounding'
import type Precision from '../common/Precision'
import { isNumber } from '../common/utils/typeChecks'

import { FormatDateType, type Options } from '../Options'

import type { XAxis } from '../component/XAxis'
import type { YAxis } from '../component/YAxis'
import type { OverlayFigure, Overlay } from '../component/Overlay'
import type OverlayImp from '../component/Overlay'

import type { EventOverlayInfo, ProgressOverlayInfo } from '../Store'
import type ChartStore from '../Store'

import OverlayYAxisView from './OverlayYAxisView'
import type { Chart } from '../Chart'

export default class OverlayXAxisView extends OverlayYAxisView<XAxis> {
  override coordinateToPointTimestampDataIndexFlag (): boolean {
    return true
  }

  override coordinateToPointValueFlag (): boolean {
    return false
  }

  override getCompleteOverlays (chartStore: ChartStore): OverlayImp[] {
    return chartStore.getOverlaysByPaneId()
  }

  override getProgressOverlay (info: ProgressOverlayInfo): OverlayImp {
    return info.overlay
  }

  override getDefaultFigures (
    overlay: Overlay,
    coordinates: Coordinate[],
    bounding: Bounding,
    _precision: Precision,
    options: Options,
    _xAxis: Nullable<XAxis>,
    _yAxis: Nullable<YAxis>,
    clickOverlayInfo: EventOverlayInfo
  ): OverlayFigure[] {
    const figures: OverlayFigure[] = []
    if (overlay.needDefaultXAxisFigure && overlay.id === clickOverlayInfo.overlay?.id) {
      let leftX = Number.MAX_SAFE_INTEGER
      let rightX = Number.MIN_SAFE_INTEGER
      coordinates.forEach((coordinate, index) => {
        leftX = Math.min(leftX, coordinate.x)
        rightX = Math.max(rightX, coordinate.x)
        const point = overlay.points[index]
        if (isNumber(point.timestamp)) {
          const text = options.customApi.formatDate(point.timestamp, 'YYYY-MM-DD HH:mm', FormatDateType.Crosshair)
          figures.push({ type: 'text', attrs: { x: coordinate.x, y: 0, text, align: 'center' }, ignoreEvent: true })
        }
      })
      if (coordinates.length > 1) {
        figures.unshift({ type: 'rect', attrs: { x: leftX, y: 0, width: rightX - leftX, height: bounding.height }, ignoreEvent: true })
      }
    }
    return figures
  }

  override getFigures (
    chart: Chart,
    o: Overlay,
    coordinates: Coordinate[],
    bounding: Bounding,
    xAxis: Nullable<XAxis>,
    yAxis: Nullable<YAxis>
  ): OverlayFigure | OverlayFigure[] {
    return o.createXAxisFigures?.({ chart, overlay: o, coordinates, bounding, xAxis, yAxis }) ?? []
  }
}
