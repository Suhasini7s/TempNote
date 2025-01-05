exports.homepage = async(req, res) =>{
    const locals={
        title:"TempNote",
        description:"Secure sharing"
    }
    res.render('index',{
        locals,
        layout:'../views/layouts/front-page'
    });
}

exports.about = async(req, res) =>{
    const locals={
        title:"About-TempNote",
        description:"Secure sharing and url connection"
    }
    res.render('about',locals)
}