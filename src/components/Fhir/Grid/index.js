import React       from "react"
import Modal from "react-modal";
import JSONViewer from "react-json-view";
import PropTypes   from "prop-types"
import { getPath,base64decodeResource } from "../../../lib"
import { connect } from "react-redux"

/**
 * Renders group of resources in a grid (table) where each component represents
 * one row...
 */
export class Grid extends React.Component
{
    static propTypes = {
        rows      : PropTypes.arrayOf(PropTypes.object).isRequired,
        cols      : PropTypes.arrayOf(PropTypes.object).isRequired,
        settings  : PropTypes.object.isRequired,
        title     : PropTypes.string,
        groupBy   : PropTypes.string,
        comparator: PropTypes.func
    };

    constructor(props) {
        super(props)
        this.state = {
            __rows: this.sortRows(this.props.rows, this.props.comparator)
        }
    }

    componentWillReceiveProps(newProps) {
        if (Array.isArray(newProps.rows)) {
            this.setState({
                __rows: this.sortRows(newProps.rows, newProps.comparator)
            });
        }
    }

    sortRows(rows, comparator) {
        if (!comparator) {
            return rows
        }
        return rows.sort(comparator)
    }

    renderResource(res, i)
    {
        

        return (
            <tr key={i}>
                {
                    this.props.cols.map((col, i) => {
                        let { render, path, cellProps, defaultValue } = col
                        cellProps = { ...cellProps, key: i }
                        if (typeof render == "function") {
                            return (
                                <td {...cellProps}>
                                    { render(res) }
                                </td>
                            )
                        }
                        return (
                            <td {...cellProps}>
                                {
                                    getPath(res, path) ||
                                    <small className="text-muted">{ defaultValue || "-" }</small>
                                }
                            </td>
                        )
                    })
                }
                <td>
                    <div className="text-primary text-center">
                        <button onClick={() => this.setState({modalOpen: true,resourceForModal: base64decodeResource(res),})}>
                            <i className="fa fa-eye fas fa-bold" />
                        </button>
                        <Modal
                            isOpen={this.state.modalOpen}
                            onRequestClose={() => this.setState({ modalOpen: false })}
                            preventScroll={true}
                        >
                            <div>
                                <JSONViewer
                                    style={{ overflow: "scroll", height: "100%" }}
                                    collapsed={false}
                                    theme="monokai"
                                    src={this.state.resourceForModal}
                                />
                            </div>{" "}
                        </Modal>
                    </div>
                </td>
            </tr>
        )
    }

    renderRows() {
        if (!this.state.__enableGrouping) {
            return this.state.__rows.map(this.renderResource, this);
        }

        let groupColIndex = this.props.groupBy ?
            this.props.cols.findIndex(c => c.name === this.props.groupBy || c.label === this.props.groupBy) :
            -1;
        let groupPath = groupColIndex > -1 ? this.props.cols[groupColIndex].path : null;

        if (!groupPath) {
            return this.state.__rows.map(this.renderResource, this);
        }

        const groups = {};
        this.state.__rows.forEach((rec, i) => {
            let groupValue = typeof groupPath == "function" ? groupPath(rec) : getPath(rec, groupPath);
            groupValue = groupValue || "Empty Group";
            if (!groups.hasOwnProperty(groupValue)) {
                groups[groupValue] = []
            }
            groups[groupValue].push(this.renderResource(rec, i));
        });

        let out = [];
        for (let group in groups) {
            if (groups[group].length > 1) {
                out.push(
                    <tr className="group-header" key={group}>
                        <th colSpan={this.props.cols.length} onClick={() => this.setState({[group] : this.state[group] === false ? true : false })}>
                        <i className={"glyphicon glyphicon-triangle-" + (
                            this.state[group] !== false ? "bottom" : "right")
                        }/> {group} <small className="badge">{groups[group].length}</small>
                        </th>
                    </tr>
                );
                if (this.state[group] !== false) {
                    out = out.concat(groups[group])
                }
            }
            else {
                out.push(<tr className="group-clear" key={group}/>)
                out = out.concat(groups[group])
            }
        }
        return out;
    }

    render()
    {
        return (
            <div className={"panel panel-default" + (this.state.__enableGrouping ? " grouped" : "")}>
                {
                    this.props.title ?
                    <div className="panel-heading">
                        {
                            this.props.groupBy && this.state.__rows.length > 1 &&
                            <label className="pull-right">
                                Group by {this.props.groupBy
                                } <input
                                    type="checkbox"
                                    checked={!!this.state.__enableGrouping}
                                    onChange={e => this.setState({
                                        __enableGrouping: e.target.checked
                                    })}
                                />
                            </label>
                        }
                        <b className="text-primary">
                            <i className="fa fa-address-card-o"/> { this.props.title }
                        </b>
                    </div> :
                    null
                }
                <div className="table-responsive">
                    <table className="table table-condensed table-hover table-striped table-bordered" style={{
                        minWidth: this.props.cols.length * 200
                    }}>
                        <thead>
                            <tr>
                                {
                                    this.props.cols.map((col, i) => {
                                        let { headerProps, label } = col
                                        headerProps = { ...headerProps, key: i }
                                        return (
                                            <th {...headerProps}>
                                                { label || "" }
                                            </th>
                                        )
                                    })
                                }
                                <th><div className="text-center">View</div></th>
                            </tr>
                        </thead>
                        <tbody>
                            { this.renderRows() }
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

export default connect(state => ({
    settings: state.settings
}))(Grid);
