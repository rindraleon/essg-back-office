import { SectionOne, SectionTwo, DependenciesExplanation, TemplateNotice } from "../../components";
import { useScrollToTop } from "../../hooks/";
import { useTitle } from "../../hooks/useTitle";

const Home = () => {
    useScrollToTop();
    useTitle("Home");
    return (
        <div>
            <TemplateNotice />
            <SectionOne />
            <SectionTwo />
            <DependenciesExplanation />
        </div>
    )
}

export default Home;