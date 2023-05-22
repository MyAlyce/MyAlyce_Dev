import React from 'react'
import { sComponent } from '../state.component'
import { showNotification } from '../../scripts/alerts'
import { Button } from '../lib/src'
import { Header } from '../ui/Header'
import { Navigation } from '../ui/Navigation'
import { UserBar } from '../ui/UserBar'
import { Statistics } from '../ui/Statistics'
import { InfoLog } from '../ui/InfoLog'
import { InfoLogPlayer } from '../ui/InfoLogPlayer'
import { MiniSurvey } from '../ui/MiniSurvey'
import { Footer } from '../ui/Footer'

export class Dev extends sComponent {

    state = { //synced with global state
       
    }

    render() {

        return (
        <>
          <Header />
          <div className="container-fluid">
      <div className="row">
      <Navigation />
      <hr></hr>
      <UserBar/>
      <hr></hr>
      <Statistics />
      <hr></hr>
      <InfoLog />
      <hr></hr>
      <InfoLogPlayer/>
      <MiniSurvey />
      <Footer />
      </div>
    </div>
          </>
        )
    }

}
