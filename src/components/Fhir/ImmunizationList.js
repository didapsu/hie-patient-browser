import React       from "react"
import PropTypes   from "prop-types"
import moment      from "moment"
import Grid        from "./Grid"
import Date        from "./Date"
import { 
    getPath, 
    codeIsNLPInsight, 
    highlightToggleButtonText,
    getInsightSource, 
    InsightSource 
} from "../../lib"
import InsightsDetailButton from "./InsightsDetailButton"

export default class ImmunizationList extends React.Component
{
    static propTypes = {
        settings: PropTypes.object.isRequired,
        resources: PropTypes.arrayOf(PropTypes.object)
    };

    // https://reactjs.org/docs/handling-events.html
    constructor(props) {
        super(props);
        this.state = { doHighlight: false }
        this.toggleHighlight = this.toggleHighlight.bind(this);
    }

    toggleHighlight() {
        this.setState(prevState => ({ 
            doHighlight: !prevState.doHighlight 
        }) );
    }

    render()
    {
        return (
            <Grid
                rows={ (this.props.resources || []).map(o => o.resource) }
                title="Immunizations"
                groupBy="Type"
                comparator={(a,b) => {
                    let dA = getPath(a, "date");
                    let dB = getPath(b, "date");
                    dA = dA ? +moment(dA) : 0;
                    dB = dB ? +moment(dB) : 0;
                    return dB - dA;
                }}
                cols={[
                    {
                        label: "Type",
                        render: o => (
                            <div className={codeIsNLPInsight(getPath(o, "vaccineCode")) ? "bg-primary" : ""}>
                                { getPath(o, "vaccineCode.coding.0.display") }
                            </div>
                        )
                    },
                    {
                        label: "Status",
                        render: o => o.status || "-"
                    },
                    {
                        label: "Date",
                        render: o => (
                            o.date ?
                                <Date moment={o.date}/> :
                                o.occurrenceDateTime ?
                                    <Date moment={o.occurrenceDateTime}/> :
                                    o.occurrenceString || "-"
                        )
                    },
                    {
                        label: <div className="text-center">
                            <button
                                title={highlightToggleButtonText}
                                onMouseUp={ this.toggleHighlight }
                                className="text-center"
                            >
                                <i className={"fa fa-lightbulb-o fa-bold"}/>
                            </button>
                        </div>,
                        render: o => {
                            if ( getInsightSource(o) != InsightSource.NONE ) {
                                return ( <InsightsDetailButton resource={o} settings={this.props.settings}/> )
                            } else {
                                return ( <div/> )
                            }
                        }
                    }
                ]}
            />
        );
    }
}