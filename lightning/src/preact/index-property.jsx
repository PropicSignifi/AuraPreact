import { h, render, setOption, } from 'preact';
import App from './components/app/app';
import DemoPreact from './apps/DemoPreact/demoPreact';

BootStrapManager.PreactStore.addComponent("helloworld", function(container, props, fireEvent, globalData) {
    render((
        <div>
            <div {...props}>Hello World</div>
            <button className="slds-button slds-button_brand" onClick={ e => fireEvent({ msg: "Test Data" }) }>Click</button>
        </div>
    ), container);
});

BootStrapManager.PreactStore.addComponent("demo_preact", function(container, props, fireEvent, globalData) {
    render((
        <DemoPreact {...props}/>
    ), container);
});
