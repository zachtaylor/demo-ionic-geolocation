import { Component, OnDestroy, OnInit } from '@angular/core'
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone'
import { ExploreContainerComponent } from '../explore-container/explore-container.component'
import { GeolocationService } from '../geolocation.service'

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent],
})
export class Tab3Page implements OnInit, OnDestroy {
  constructor(private geolocation: GeolocationService) {}

  ngOnInit() {
    console.log('Tab3 init')
    this.geolocation.start()
  }

  ngOnDestroy() {
    console.log('Tab3 destroyed')
  }
}
