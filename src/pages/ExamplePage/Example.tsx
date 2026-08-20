import { ExampleComponents } from "../../components";
import { useScrollToTop } from "../../hooks/";
import { useTitle } from "../../hooks/useTitle";


const Example = () => {
    useScrollToTop();
    useTitle("Example");
    return (
        <div>
            <ExampleComponents />
        </div>
    )
}

export default Example;