
const Flap = ({ color, colorPicker, laddiesJacket, colors }) => (
    <g id="flap" className="cjd-color-hover" onClick={ () => colorPicker("buttons") } transform={laddiesJacket ? "translate(240, 105)" : "translate(242.6, 103)"}>
        <path class="cls-1" transform={laddiesJacket && "scale(0.8)"} d="M23.89,104.76c-9.12,24.13-15.8,38.72-19.64,53.63C2.06,167.62.5,173.88.5,173.88V372.81h0v52.41c7.33.68,20.3.16,34.64-.47V75.52A271.77,271.77,0,0,0,23.89,104.76Z" fill={colors.body ? colors.body : '#ffffff'} stroke="#000" stroke-miterlimit="10" stroke-width="1"></path>
        <path class="cls-1" transform={laddiesJacket && "scale(0.8)"} d="M57,20.49C44.86-4.45,19,1,19,1s.07,78.08-2.26,101.33c-1.57,15.87-9,40.09-13.57,60.53,3.84-15.73,10.53-30.8,19.65-56.27C33.77,76,50.06,43.92,56.09,31.21,58.65,25.82,58.57,23.8,57,20.49Z" fill={colors.body ? colors.body : '#ffffff'} stroke="#000" stroke-miterlimit="10" stroke-width="1"></path>
        <g fill="#ffffff" stroke="#000" stroke-miterlimit="10" stroke-width="1" transform={laddiesJacket && "scale(0.8)"}>
            <path fill={color} id="button" class="cls-2" d="M11.7,405.07a6.57,6.57,0,1,1-6.54,6.6v0h0A6.59,6.59,0,0,1,11.7,405.07Z"></path><path id="button-2" fill={color} class="cls-2" d="M11.7,381.36A6.57,6.57,0,1,1,5.16,388v0a6.57,6.57,0,0,1,6.57-6.57h0Z"></path></g>
    </g>
)        

export default Flap