import React, {Component} from 'react'
import {state} from '../../../scripts/client'

import './BeatingSVG.css'
import { Col } from 'react-bootstrap';

type BeatingSVGProps = {
    style?:any, 
    bpm?:number, 
    size?:number, 
    subscribeTo?:string, 
    objectKey?:string, 
    svgPath?:string, 
    polyLinePoints?:string,
    customContent?:any
};

export class BeatingSVG extends Component<BeatingSVGProps> {

    unique=`animation${Math.floor(Math.random()*1000000000000000)}`;

    animation;
    animating = true;
    bpm=60;
    svgPath = "M50,85 C25,60 10,40 10,20 C10,-5 40,-5 50,10 C60,-5 90,-5 90,20 C90,40 75,60 50,85z";
    polyLinePoints;
    customContent;
    sub;

    constructor(props:BeatingSVGProps) {
        super(props);
        if(props.bpm) this.bpm = props.bpm;
        if(props.svgPath) this.svgPath = props.svgPath;
        if(props.polyLinePoints) this.polyLinePoints = props.polyLinePoints;
        if(props.customContent) this.customContent = props.customContent;
    }

    componentDidMount(): void {

        if(this.props.subscribeTo) {
            this.sub = state.subscribeEvent(this.props.subscribeTo, (res) => {
                if(this.props.objectKey) {
                    this.bpm = res[this.props.objectKey] ? res[this.props.objectKey] : this.bpm;
                } else this.bpm = res ? res : this.bpm;
                if(Array.isArray(this.bpm)) this.bpm = this.bpm[0];
            })
        }

        this.animating = true;

        let anim = () => {
            this.animateHearts(this.bpm).then(() => {
                if(this.animating) this.animation = requestAnimationFrame(anim);
            });
        }

        this.animation = requestAnimationFrame(anim);
    }

    componentWillUnmount(): void {
        this.animating = false;
        if(this.sub) {
            state.unsubscribeEvent(this.props.subscribeTo as string, this.sub);
        }
        if(this.animation) cancelAnimationFrame(this.animation);
    }

    animateHearts(bpm= this.bpm ? this.bpm : 60) {
        return new Promise((res,rej) => {
            let bps = bpm/60;
            const svgContainer = document.getElementById(this.unique+'ghosthearts') as HTMLElement; 
            const svgCopy = svgContainer.cloneNode(true) as HTMLElement; // Create a copy of the SVG container
            const ghostHearts  = Array.from(svgCopy.getElementsByClassName('ghost-heart'));
            const ghostHearts2 = Array.from(svgCopy.getElementsByClassName('ghost-heart2'));
    
            ghostHearts.forEach((heart:any, index) => {
                heart.style.animation = `heartbeat ${bps}s ease-out`;
            });
    
            ghostHearts2.forEach((heart:any, index) => {
                heart.style.animation = `heartbeat2 ${bps}s ease-out`;
            });
    
            svgContainer.parentNode?.insertBefore(svgCopy, svgContainer.nextSibling); // Insert the copy after the original SVG container
            setTimeout(() => {
                svgCopy.remove(); // Remove the copy once the animation is finished
                res(true);
            }, (1/bps) * 1000);
        })
        
    }

    render() {
        return (
            <span>{
                this.customContent ? <div style={{display:'block', position:'relative'}}>
                    <span className='heart'  style={{position:"absolute", zIndex:"0"}}>
                        {this.customContent}
                    </span> 
                    <span id={this.unique+"ghosthearts"} style={{position:"absolute", zIndex:"1"}}>
                        <span className='ghost-heart' style={{position:"absolute", zIndex:"2"}}>{this.customContent}</span> 
                        <span className='ghost-heart2' style={{position:"absolute", zIndex:"3"}}>{this.customContent}</span> 
                    </span>
                </div>
                    : 
                <svg 
                    width={this.props.size ? this.props.size+'px' : "50px"} 
                    height={this.props.size ? this.props.size+'px' : "50px"} 
                    viewBox={this.props.size ? `${-this.props.size*0.25},${-this.props.size*0.25},${this.props.size*2.25},${this.props.size*2.25}` : "-20,-20,120,120"}
                >
                    <g>
                        {/* <!-- Main heart --> */}
                        {this.polyLinePoints ? <polyline className="heart" style={this.props.style} points={this.polyLinePoints}></polyline> 
                            : <path style={this.props.style} className="heart" d={this.svgPath} />
                        }
                        {/* <!-- Animated hearts --> */}
                        <g id={this.unique+"ghosthearts"}>
                            {this.polyLinePoints ? <polyline className="ghost-heart" style={this.props.style} points={this.polyLinePoints}></polyline>
                                : <path style={this.props.style} className="ghost-heart" d={this.svgPath} />
                            }
                            {this.polyLinePoints ? <polyline className="ghost-heart2" points={this.polyLinePoints}></polyline>
                                : <path style={this.props.style} className="ghost-heart2" d={this.svgPath} />
                            }
                        </g>
                    </g>
                </svg>
            }
            </span>
        )
    }
}