import { Component } from '@angular/core';
import { Geolocation, PositionOptions } from '@capacitor/geolocation';
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';
import { AlertController, LoadingController } from "@ionic/angular";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  constructor(private alertController : AlertController, private loadingController: LoadingController) {}

  async getCurrentLocation(){
    try{
      const permissionStatus = await Geolocation.checkPermissions();

      if(permissionStatus?.location != 'granted'){
        const requestStatus = await Geolocation.requestPermissions();

        if(requestStatus?.location != 'granted'){
          await this.openSettings(true);
          return;
        }
      }

      let options: PositionOptions = {
        maximumAge: 3000,
        timeout: 10000,
        enableHighAccuracy: true
      }

      const loading = await this.presentLoadingAlert('Getting location...');

      await Geolocation.getCurrentPosition(options).then((res) => {
        console.log('Current position: ', res.coords.latitude, res.coords.longitude);
        loading.dismiss();
        this.presentAlert(res.coords.latitude.toString(), res.coords.longitude.toString());
      });
    } catch (error: any){
      if(error?.message == 'Location services are not enabled'){
        await this.openSettings();
      }
      console.log('Error getting location: ', error);
    }
  }

  async presentAlert(latitude: string, longitude: string) {
    const alert = await this.alertController.create({
      header: 'Geolocation App',
      subHeader: 'Current Location',
      message: 'Latitude: ' + latitude + ' Longitude: ' + longitude,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async presentLoadingAlert(message: string){
    const loading = await this.loadingController.create({
      message: message
    });

    await loading.present();
    return loading;
  }

  openSettings(app = false) {
    console.log('Opening settings');

    return NativeSettings.open({ 
      optionAndroid: app ? AndroidSettings.ApplicationDetails : AndroidSettings.Location,
      optionIOS: app ? IOSSettings.App : IOSSettings.LocationServices
     });
  }
}
