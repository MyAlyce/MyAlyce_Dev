import React from 'react'
import { sComponent } from '../state.component'
import { Header } from '../modules/Header/Header'
import { Navigation } from '../modules/Navigation/Navigation'
import { UserBar } from '../modules/User/UserBar'
import { Statistics } from '../ui/Statistics'
import { InfoLog } from '../ui_wip/InfoLog'
import { InfoLogPlayer } from '../ui_wip/InfoLogPlayer'
import { MiniSurvey } from '../ui_wip/MiniSurvey'
import { Footer } from '../modules/Footer/Footer'

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
